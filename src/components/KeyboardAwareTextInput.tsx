import { useRef, type ComponentProps, type ComponentRef } from 'react';
import { TextInput as NativeTextInput } from 'react-native';
import { TextInput } from 'react-native-paper';

type Props = Omit<ComponentProps<typeof TextInput>, 'render' | 'ref'> & {
  keyboardOffset: number;
  onInputFocus: (input: ComponentRef<typeof NativeTextInput> | null, offset?: number) => void;
};

// Mantém a referência ao campo nativo para a rolagem, usando o visual do Paper.
export function KeyboardAwareTextInput({ keyboardOffset, onInputFocus, onFocus, ...props }: Props) {
  const nativeInput = useRef<ComponentRef<typeof NativeTextInput>>(null);
  return (
    <TextInput
      mode="outlined"
      {...props}
      onFocus={(event) => {
        onInputFocus(nativeInput.current, keyboardOffset);
        onFocus?.(event);
      }}
      render={({ ref: paperRef, ...inputProps }) => (
        <NativeTextInput
          {...inputProps}
          ref={(input) => {
            nativeInput.current = input;
            paperRef(input as unknown as Parameters<typeof paperRef>[0]);
          }}
        />
      )}
    />
  );
}
