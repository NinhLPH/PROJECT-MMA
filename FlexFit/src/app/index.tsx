import { useCallback, useEffect, useRef, useState } from "react";
import {
  findNodeHandle,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  type ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";

import { ApiError } from "@/api";
import { AppButton } from "@/components/ui/AppButton";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ROUTES } from "@/constants/routes";
import {
  COLORS,
  FONT_FAMILIES,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

type AuthMode = "login" | "register";
type FieldName = "email" | "fullName" | "password" | "phoneNumber";
type FormErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PHONE_PATTERN = /^\+?[0-9]{9,12}$/;
const PHONE_ACCESSORY_ID = "flexfit-phone-accessory";

function getApiErrorMessage(error: unknown, mode: AuthMode): string {
  if (!(error instanceof ApiError)) {
    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }

  if (error.status === 401) {
    return "Email hoặc mật khẩu chưa chính xác. Hãy kiểm tra và thử lại.";
  }

  if (error.status === 409 && mode === "register") {
    return "Email này đã được đăng ký. Hãy chuyển sang đăng nhập.";
  }

  if (error.status === null) {
    return "Không thể kết nối máy chủ FlexFit.";
  }

  return "Không thể xử lý yêu cầu lúc này. Vui lòng kiểm tra thông tin và thử lại.";
}

export default function AuthScreen() {
  const router = useRouter();
  const { isAuthenticated, signIn, signUp } = useAuth();
  const { contentPadding, isCompact } = useResponsiveLayout();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const requestErrorRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const focusScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollNodeIntoView = useCallback((node: TextInput | View | null, extraOffset = 64) => {
    if (!node || Platform.OS === "web") return;
    const nodeHandle = findNodeHandle(node);
    if (nodeHandle === null) return;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        nodeHandle,
        extraOffset,
        true,
      );
    });
  }, []);

  const handleInputFocus = useCallback(
    (node: TextInput | null) => {
      if (!node) return;
      focusedInputRef.current = node;
      scrollNodeIntoView(node);

      if (focusScrollTimerRef.current) {
        clearTimeout(focusScrollTimerRef.current);
      }

      focusScrollTimerRef.current = setTimeout(
        () => scrollNodeIntoView(node),
        Platform.OS === "android" ? 180 : 80,
      );
    },
    [scrollNodeIntoView],
  );

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener("keyboardDidShow", () => {
      scrollNodeIntoView(focusedInputRef.current);
    });

    return () => {
      keyboardSubscription.remove();
      if (focusScrollTimerRef.current) {
        clearTimeout(focusScrollTimerRef.current);
      }
    };
  }, [scrollNodeIntoView]);

  useEffect(() => {
    if (requestError) {
      scrollNodeIntoView(requestErrorRef.current, 20);
    }
  }, [requestError, scrollNodeIntoView]);

  if (isAuthenticated) {
    return <Redirect href={ROUTES.HOME} />;
  }

  const values = { email, fullName, password, phoneNumber };

  function getFieldError(field: FieldName): string | undefined {
    const value = values[field].trim();

    if (field === "fullName" && mode === "register" && value.length < 2) {
      return "Nhập họ tên đầy đủ của bạn.";
    }

    if (field === "phoneNumber" && mode === "register") {
      const normalizedPhone = value.replace(/[\s-]/g, "");
      if (!PHONE_PATTERN.test(normalizedPhone)) {
        return "Số điện thoại cần có từ 9 đến 12 chữ số.";
      }
    }

    if (field === "email" && !EMAIL_PATTERN.test(value)) {
      return "Nhập email đúng định dạng, ví dụ ban@flexfit.vn.";
    }

    if (field === "password" && password.length < 6) {
      return "Mật khẩu cần ít nhất 6 ký tự.";
    }

    return undefined;
  }

  function validateField(field: FieldName) {
    const error = getFieldError(field);
    setErrors((current) => ({ ...current, [field]: error }));
  }

  function clearFieldError(field: FieldName) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError(null);
  }

  function switchMode(nextMode: AuthMode) {
    if (isSubmitting || nextMode === mode) return;
    setMode(nextMode);
    setErrors({});
    setRequestError(null);
  }

  function focusFirstInvalidField(nextErrors: FormErrors) {
    const focusOrder: Array<[FieldName, React.RefObject<TextInput | null>]> =
      mode === "register"
        ? [
            ["fullName", fullNameRef],
            ["phoneNumber", phoneRef],
            ["email", emailRef],
            ["password", passwordRef],
          ]
        : [
            ["email", emailRef],
            ["password", passwordRef],
          ];

    const invalidInput = focusOrder.find(([field]) => nextErrors[field])?.[1].current;
    if (!invalidInput) return;

    invalidInput.focus();
    handleInputFocus(invalidInput);
  }

  async function handleSubmit() {
    const fields: FieldName[] =
      mode === "register"
        ? ["fullName", "phoneNumber", "email", "password"]
        : ["email", "password"];
    const nextErrors = fields.reduce<FormErrors>((result, field) => {
      const error = getFieldError(field);
      if (error) result[field] = error;
      return result;
    }, {});

    setErrors(nextErrors);
    setRequestError(null);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "login") {
        await signIn({ email: normalizedEmail, password });
      } else {
        await signUp({
          email: normalizedEmail,
          fullName: fullName.trim(),
          password,
          phoneNumber: phoneNumber.replace(/[\s-]/g, ""),
        });
      }

      router.replace(ROUTES.HOME);
    } catch (error) {
      setRequestError(getApiErrorMessage(error, mode));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : Platform.OS === "android"
            ? "height"
            : undefined
      }
      enabled={Platform.OS !== "web"}
      style={styles.keyboardView}
    >
      <ScreenContainer
        ref={scrollRef}
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: contentPadding },
          isCompact && styles.containerCompact,
        ]}
        safeAreaEdges={["top", "left", "right", "bottom"]}
        scrollViewProps={{
          automaticallyAdjustKeyboardInsets: false,
          contentInsetAdjustmentBehavior: "automatic",
        }}
      >
        <View pointerEvents="none" style={styles.backgroundMark}>
          <View style={styles.backgroundSlash} />
          <View style={styles.backgroundSlashSecondary} />
        </View>

        <View style={styles.brandRow}>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>FF</Text>
          </View>
          <View>
            <Text style={styles.brandName}>FLEXFIT</Text>
            <Text style={styles.brandLine}>TRAIN HARD · BOOK SMART</Text>
          </View>
        </View>

        <View style={[styles.hero, isCompact && styles.heroCompact]}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerLine} />
            <Text style={styles.kicker}>PT BOOKING PLATFORM</Text>
          </View>
          <Text accessibilityRole="header" style={styles.heroTitle}>
            CHỦ ĐỘNG{`\n`}MỖI BUỔI <Text style={styles.heroAccent}>TẬP.</Text>
          </Text>
          <Text style={styles.heroBody}>
            Chọn đúng huấn luyện viên. Khóa lịch tập phù hợp. Theo dõi từng bước tiến bộ.
          </Text>
        </View>

        <View style={[styles.formPanel, isCompact && styles.formPanelCompact]}>
          <View accessibilityRole="tablist" style={styles.modeSwitcher}>
            <Pressable
              android_ripple={{ color: "rgba(255, 255, 255, 0.16)" }}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "login" }}
              disabled={isSubmitting}
              onPress={() => switchMode("login")}
              style={({ pressed }) => [
                styles.modeButton,
                mode === "login" && styles.modeButtonActive,
                pressed && Platform.OS !== "android" && styles.modeButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  mode === "login" && styles.modeLabelActive,
                ]}
              >
                ĐĂNG NHẬP
              </Text>
            </Pressable>
            <Pressable
              android_ripple={{ color: "rgba(255, 255, 255, 0.16)" }}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "register" }}
              disabled={isSubmitting}
              onPress={() => switchMode("register")}
              style={({ pressed }) => [
                styles.modeButton,
                mode === "register" && styles.modeButtonActive,
                pressed && Platform.OS !== "android" && styles.modeButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  mode === "register" && styles.modeLabelActive,
                ]}
              >
                TẠO TÀI KHOẢN
              </Text>
            </Pressable>
          </View>

          <View style={styles.formHeading}>
            <Text style={styles.formTitle}>
              {mode === "login" ? "QUAY LẠI ĐƯỜNG TẬP" : "BẮT ĐẦU HÀNH TRÌNH"}
            </Text>
            <Text style={styles.formDescription}>
              {mode === "login"
                ? "Đăng nhập để quản lý lịch tập của bạn."
                : "Tạo hồ sơ học viên và đặt buổi tập đầu tiên."}
            </Text>
          </View>

          {requestError ? (
            <View ref={requestErrorRef} accessibilityLiveRegion="polite" style={styles.errorBanner}>
              <SymbolView
                name={{
                  android: "error",
                  ios: "exclamationmark.triangle.fill",
                  web: "error",
                }}
                size={20}
                tintColor={COLORS.danger}
              />
              <Text accessibilityRole="alert" style={styles.errorBannerText}>
                {requestError}
              </Text>
            </View>
          ) : null}

          <View style={styles.fields}>
            {mode === "register" ? (
              <>
                <AppTextInput
                  ref={fullNameRef}
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!isSubmitting}
                  error={errors.fullName}
                  label="Họ và tên"
                  onBlur={() => validateField("fullName")}
                  onChangeText={(value) => {
                    setFullName(value);
                    clearFieldError("fullName");
                  }}
                  onFocus={() => handleInputFocus(fullNameRef.current)}
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  placeholder="Họ và tên"
                  returnKeyType="next"
                  submitBehavior="submit"
                  textContentType="name"
                  value={fullName}
                />
                <AppTextInput
                  ref={phoneRef}
                  autoComplete="tel"
                  editable={!isSubmitting}
                  error={errors.phoneNumber}
                  inputAccessoryViewID={Platform.OS === "ios" ? PHONE_ACCESSORY_ID : undefined}
                  keyboardType="phone-pad"
                  label="Số điện thoại"
                  onBlur={() => validateField("phoneNumber")}
                  onChangeText={(value) => {
                    setPhoneNumber(value);
                    clearFieldError("phoneNumber");
                  }}
                  onFocus={() => handleInputFocus(phoneRef.current)}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  placeholder="090 123 4567"
                  returnKeyType="next"
                  submitBehavior="submit"
                  textContentType="telephoneNumber"
                  value={phoneNumber}
                />
              </>
            ) : null}

            <AppTextInput
              ref={emailRef}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isSubmitting}
              error={errors.email}
              keyboardType="email-address"
              label="Email"
              onBlur={() => validateField("email")}
              onChangeText={(value) => {
                setEmail(value);
                clearFieldError("email");
              }}
              onFocus={() => handleInputFocus(emailRef.current)}
              onSubmitEditing={() => passwordRef.current?.focus()}
              placeholder="ban@flexfit.vn"
              returnKeyType="next"
              submitBehavior="submit"
              textContentType="emailAddress"
              value={email}
            />

            <AppTextInput
              ref={passwordRef}
              autoCapitalize="none"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              editable={!isSubmitting}
              error={errors.password}
              label="Mật khẩu"
              onBlur={() => validateField("password")}
              onChangeText={(value) => {
                setPassword(value);
                clearFieldError("password");
              }}
              onFocus={() => handleInputFocus(passwordRef.current)}
              onSubmitEditing={() => void handleSubmit()}
              placeholder="Tối thiểu 6 ký tự"
              returnKeyType="done"
              rightAccessory={
                <Pressable
                  android_ripple={{ color: "rgba(255, 255, 255, 0.14)", borderless: true }}
                  accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setShowPassword((current) => !current)}
                  style={({ pressed }) => [
                    styles.passwordToggle,
                    pressed && styles.passwordTogglePressed,
                  ]}
                >
                  <SymbolView
                    name={{
                      android: showPassword ? "visibility_off" : "visibility",
                      ios: showPassword ? "eye.slash" : "eye",
                      web: showPassword ? "visibility_off" : "visibility",
                    }}
                    size={22}
                    tintColor={COLORS.textSecondary}
                  />
                </Pressable>
              }
              secureTextEntry={!showPassword}
              submitBehavior="blurAndSubmit"
              textContentType={mode === "login" ? "password" : "newPassword"}
              value={password}
            />
          </View>

          <View style={styles.submitArea}>
            <AppButton
              accessibilityLabel={
                mode === "login" ? "Đăng nhập FlexFit" : "Tạo tài khoản FlexFit"
              }
              fullWidth
              label={mode === "login" ? "VÀO FLEXFIT" : "TẠO TÀI KHOẢN"}
              loading={isSubmitting}
              onPress={() => void handleSubmit()}
              size="lg"
            />
            <Text style={styles.privacyText}>
              Bằng cách tiếp tục, bạn đồng ý sử dụng thông tin tài khoản cho việc quản lý lịch tập FlexFit.
            </Text>
          </View>
        </View>

      </ScreenContainer>

      {Platform.OS === "ios" ? (
        <InputAccessoryView nativeID={PHONE_ACCESSORY_ID}>
          <View style={styles.keyboardAccessory}>
            <Pressable
              accessibilityLabel="Đóng bàn phím"
              accessibilityRole="button"
              onPress={Keyboard.dismiss}
              style={({ pressed }) => [
                styles.keyboardAccessoryButton,
                pressed && styles.keyboardAccessoryButtonPressed,
              ]}
            >
              <Text style={styles.keyboardAccessoryText}>XONG</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Chuyển đến ô email"
              accessibilityRole="button"
              onPress={() => emailRef.current?.focus()}
              style={({ pressed }) => [
                styles.keyboardAccessoryButton,
                pressed && styles.keyboardAccessoryButtonPressed,
              ]}
            >
              <Text style={styles.keyboardAccessoryText}>TIẾP</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundMark: {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
  },
  backgroundSlash: {
    backgroundColor: COLORS.primarySoft,
    height: 420,
    opacity: 0.34,
    position: "absolute",
    right: -120,
    top: -120,
    transform: [{ rotate: "18deg" }],
    width: 92,
  },
  backgroundSlashSecondary: {
    backgroundColor: COLORS.surfaceElevated,
    height: 360,
    opacity: 0.4,
    position: "absolute",
    right: -12,
    top: -70,
    transform: [{ rotate: "18deg" }],
    width: 24,
  },
  brandLine: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.semibold,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 2,
  },
  brandName: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 18,
    letterSpacing: 1.6,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    zIndex: 1,
  },
  container: {
    alignSelf: "center",
    maxWidth: 520,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    width: "100%",
  },
  containerCompact: {
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  errorBanner: {
    alignItems: "flex-start",
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  errorBannerText: {
    color: COLORS.danger,
    flex: 1,
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  fields: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  formDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.xs,
  },
  formHeading: {
    marginTop: SPACING.xl,
  },
  formPanel: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderTopColor: COLORS.primary,
    borderTopWidth: 3,
    borderWidth: 1,
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
    zIndex: 1,
  },
  formPanelCompact: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
  },
  formTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 18,
    letterSpacing: 0.35,
  },
  hero: {
    marginTop: 54,
    zIndex: 1,
  },
  heroCompact: {
    marginTop: SPACING.xxl,
  },
  heroAccent: {
    color: COLORS.primary,
  },
  heroBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 15,
    lineHeight: 23,
    marginTop: SPACING.md,
    maxWidth: 430,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 38,
    letterSpacing: -1,
    lineHeight: 42,
    marginTop: SPACING.sm,
  },
  keyboardView: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  keyboardAccessory: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    minHeight: 48,
    paddingHorizontal: SPACING.sm,
  },
  keyboardAccessoryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 64,
    paddingHorizontal: SPACING.sm,
  },
  keyboardAccessoryButtonPressed: {
    opacity: 0.65,
  },
  keyboardAccessoryText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 13,
  },
  kicker: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  kickerLine: {
    backgroundColor: COLORS.primary,
    height: 2,
    width: 28,
  },
  kickerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
  },
  modeButton: {
    alignItems: "center",
    borderRadius: RADIUS.sm,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    overflow: "hidden",
    paddingHorizontal: SPACING.xs,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonPressed: {
    opacity: 0.78,
  },
  modeLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textAlign: "center",
  },
  modeLabelActive: {
    color: COLORS.white,
  },
  modeSwitcher: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.xxs,
    padding: SPACING.xxs,
  },
  monogram: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    height: 46,
    justifyContent: "center",
    transform: [{ skewX: "-7deg" }],
    width: 46,
  },
  monogramText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 17,
    letterSpacing: -0.8,
    transform: [{ skewX: "7deg" }],
  },
  passwordToggle: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  passwordTogglePressed: {
    backgroundColor: COLORS.surfaceElevated,
  },
  privacyText: {
    color: COLORS.textMuted,
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
  submitArea: {
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
});
