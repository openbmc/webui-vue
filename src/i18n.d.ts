declare module '@/i18n' {
  interface I18nInstance {
    global: {
      t: (key: string, ...args: unknown[]) => string;
    };
  }
  const i18n: I18nInstance;
  export default i18n;
}
