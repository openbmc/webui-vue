const setFocusMixin = {
  methods: {
    setFocus(element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
      // Reason: https://axesslab.com/skip-links/#update-3-a-comment-from-gov-uk
      element.removeAttribute('tabindex');
    },
  },
};

export default setFocusMixin;
