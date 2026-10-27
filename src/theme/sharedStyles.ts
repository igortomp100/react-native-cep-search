import { StyleSheet } from 'react-native';
import { layout, sizes, spacing } from './tokens';

export const sharedStyles = StyleSheet.create({
  screen: { flex: 1 },
  stack: { gap: spacing.lg },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  buttonContent: { minHeight: sizes.buttonHeight },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
