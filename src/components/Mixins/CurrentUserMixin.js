const CurrentUserMixin = {
  computed: {
    currentUser() {
      const value = this.$store.getters['userManagement/allUsers'].filter(
        (user) => user.Id === this.$store.getters['global/username']
      )[0];
      return value;
    },
  },
};

export default CurrentUserMixin;
