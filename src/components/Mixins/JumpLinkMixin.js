const JumpLinkMixin = {
  methods: {
    setFocus(element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
      element.removeAttribute('tabindex');
    },
  },
};

export default JumpLinkMixin;
