export interface AppEnv {
  Bindings: {
    readLegacyGetBody?: () => ReadableStream<Uint8Array<ArrayBuffer>>;
  };
}
