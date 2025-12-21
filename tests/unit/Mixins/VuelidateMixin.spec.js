import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

describe('VuelidateMixin.js', () => {
  describe('getValidationState method', () => {
    const { getValidationState } = VuelidateMixin.methods;

    it('should return null when model is undefined', () => {
      expect(getValidationState(undefined)).toBe(null);
    });

    it('should return null when model is null', () => {
      expect(getValidationState(null)).toBe(null);
    });

    it('should return null when field is not dirty', () => {
      const model = { $dirty: false, $error: false };
      expect(getValidationState(model)).toBe(null);
    });

    it('should return true when field is dirty and has no error', () => {
      const model = { $dirty: true, $error: false };
      expect(getValidationState(model)).toBe(true);
    });

    it('should return false when field is dirty and has error', () => {
      const model = { $dirty: true, $error: true };
      expect(getValidationState(model)).toBe(false);
    });
  });
});

