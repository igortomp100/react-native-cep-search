import { useCallback, useEffect, useRef, type ComponentRef } from "react";
import { FlatList, Keyboard, Platform, TextInput } from "react-native";

export function useKeyboardAwareList<T>() {
  const listRef = useRef<FlatList<T>>(null);
  const focusedInput = useRef<ComponentRef<typeof TextInput> | null>(null);
  const additionalOffset = useRef(16);
  const frame = useRef<number | null>(null);

  const revealFocusedInput = useCallback(() => {
    if (Platform.OS === "web") return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const input = focusedInput.current;
      if (!Keyboard.isVisible() || !input?.isFocused()) return;
      // Usa a margem informada pelo campo que está com foco.
      listRef.current
        ?.getScrollResponder()
        ?.scrollResponderScrollNativeHandleToKeyboard(input, additionalOffset.current, true);
    });
  }, []);

  const onInputFocus = useCallback(
    (input: ComponentRef<typeof TextInput> | null, offset = 16) => {
      focusedInput.current = input;
      additionalOffset.current = offset;
      revealFocusedInput();
    },
    [revealFocusedInput],
  );

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = Keyboard.addListener(
      "keyboardDidShow",
      revealFocusedInput,
    );
    return () => {
      subscription.remove();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [revealFocusedInput]);

  return { listRef, onInputFocus, revealFocusedInput };
}
