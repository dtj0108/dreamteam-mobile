import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { Product, PRODUCTS, useCurrentProduct } from "@/providers/product-provider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

interface ProductDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function ProductDrawer({ visible, onClose }: ProductDrawerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const currentProduct = useCurrentProduct();
  const isOnHub = pathname.startsWith("/hub");

  // Animation values
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from left with spring animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to left (faster)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleSelectProduct = (product: Product) => {
    router.push(product.route as any);
    onClose();
  };

  const handleHub = () => {
    router.push("/(main)/hub");
    onClose();
  };

  const handleSettings = () => {
    onClose();
    router.push("/(main)/more/settings");
  };

  const handleClose = () => {
    // Animate out before closing (fast easeIn)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            opacity: backdropAnim,
          }}
        >
          <Pressable onPress={handleClose} style={{ flex: 1 }} />
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
            backgroundColor: "#ffffff",
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <View
            style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom }}
            className="flex-1"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-4">
              <Text className="text-2xl font-bold text-foreground">
                Products
              </Text>
              <Pressable onPress={handleClose} className="p-2">
                <FontAwesome name="times" size={20} color={Colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Hub Button */}
            <Pressable
              onPress={handleHub}
              className={`mx-2 mb-3 flex-row items-center rounded-xl p-3 ${
                isOnHub ? "bg-primary/10" : "active:bg-muted"
              }`}
            >
              <View
                className={`h-12 w-12 items-center justify-center rounded-xl ${
                  isOnHub ? "bg-primary" : "bg-muted"
                }`}
              >
                <Ionicons
                  name="grid"
                  size={24}
                  color={isOnHub ? "#ffffff" : Colors.mutedForeground}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Hub
                </Text>
                <Text className="text-sm text-muted-foreground">
                  All products
                </Text>
              </View>
              {isOnHub && (
                <FontAwesome name="check" size={16} color={Colors.primary} />
              )}
            </Pressable>

            <View className="mx-4 mb-2 h-px bg-border" />

            {/* Product List */}
            <ScrollView className="flex-1 px-2">
              {PRODUCTS.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isSelected={currentProduct?.id === product.id}
                  onSelect={() => handleSelectProduct(product)}
                />
              ))}
            </ScrollView>

            {/* Bottom Actions */}
            <View className="border-t border-border px-2 pt-2">
              <ActionRow
                icon="cog"
                label="Settings"
                onPress={handleSettings}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

function ProductRow({ product, isSelected, onSelect }: ProductRowProps) {
  return (
    <Pressable
      onPress={onSelect}
      className={`mb-1 flex-row items-center rounded-lg p-3 ${
        isSelected ? "bg-gray-200" : "active:bg-muted"
      }`}
    >
      {/* Product Emoji */}
      <View
        className={`h-12 w-12 items-center justify-center rounded-xl ${
          isSelected ? "bg-gray-700" : "bg-muted"
        }`}
      >
        <Text className="text-2xl">{product.emoji}</Text>
      </View>

      {/* Product Info */}
      <View className="ml-3 flex-1">
        <Text
          className="text-base font-semibold text-foreground"
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {product.description}
        </Text>
      </View>

      {/* Check mark for selected */}
      {isSelected && (
        <FontAwesome name="check" size={16} color={Colors.foreground} />
      )}
    </Pressable>
  );
}

interface ActionRowProps {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: string;
  onPress: () => void;
}

function ActionRow({ icon, label, onPress }: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-lg p-3 active:bg-muted"
    >
      <FontAwesome name={icon} size={18} color={Colors.mutedForeground} />
      <Text className="ml-3 text-base text-foreground">{label}</Text>
    </Pressable>
  );
}
