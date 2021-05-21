const JumpLinkMixin = {
  methods: {
    setFocus(element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
      // Reason: https://axesslab.com/skip-links/#update-3-a-comment-from-gov-uk
      element.removeAttribute('tabindex');
    },
    scrollToOffset(event) {
      // Select element to scroll to
      const ref = event.target.getAttribute('data-ref');
      const element = this.$refs[ref].$el;

      // Set focus and tabindex on selected element
      this.setFocus(element);

      // Set scroll offset below header
      const offset = element.offsetTop - 50;
      window.scroll({
        top: offset,
        behavior: 'smooth',
      });
    },
  },
};

export default JumpLinkMixin;
