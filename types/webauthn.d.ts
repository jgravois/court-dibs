// TODO: don't assume that all browsers will support PublicKeyCredential

interface PublicKeyCredential {
  toJSON(): Record<string, unknown>;
}

// Augment the static side of PublicKeyCredential
interface PublicKeyCredentialConstructor {
  parseCreationOptionsFromJSON(
    options: unknown,
  ): PublicKeyCredentialCreationOptions;
  parseRequestOptionsFromJSON(
    options: unknown,
  ): PublicKeyCredentialRequestOptions;
}

// Tell TS that the global PublicKeyCredential object has these static methods
type PublicKeyCredentialWithJSON = typeof PublicKeyCredential &
  PublicKeyCredentialConstructor;
