import type { ComponentProps } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

type MockScreenAction = {
  label: string;
  onPress: NonNullable<ComponentProps<typeof Button>["onPress"]>;
};

type MockScreenProps = {
  title: string;
  description: string;
  actions: MockScreenAction[];
};

export function MockScreen({ title, description, actions }: MockScreenProps) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        {actions.map((action) => (
          <View key={action.label} style={styles.action}>
            <Button title={action.label} onPress={action.onPress} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  actions: {
    marginTop: 32,
  },
  action: {
    marginBottom: 12,
  },
});
