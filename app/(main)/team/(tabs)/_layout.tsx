import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TeamTabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "number", selected: "number" }} />
        <Label>Channels</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dms">
        <Icon sf={{ default: "bubble.left", selected: "bubble.left.fill" }} />
        <Label>DMs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mentions">
        <Icon sf={{ default: "at", selected: "at" }} />
        <Label>Mentions</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="agents">
        <Icon sf={{ default: "cpu", selected: "cpu.fill" }} />
        <Label>Agents</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
