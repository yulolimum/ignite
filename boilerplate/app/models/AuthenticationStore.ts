import { Instance, SnapshotOut, types } from "mobx-state-tree"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    authEmail: "",
  })
  .volatile<AuthenticationStoreVolatileProps>((store) => ({
    authTokenStatus: "none", // <-- this will never be persisted to storage and will always rehydrate to "none"
  }))
  .views((store) => ({
    get isAuthenticated() {
      return !!store.authToken
    },
    get validationError() {
      if (store.authEmail.length === 0) return "can't be blank"
      if (store.authEmail.length < 6) return "must be at least 6 characters"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.authEmail))
        return "must be a valid email address"
      return ""
    },
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setAuthTokenStatus(value: AuthenticationStoreVolatileProps["authTokenStatus"]) {
      store.authTokenStatus = value
    },
    setAuthEmail(value: string) {
      store.authEmail = value.replace(/ /g, "")
    },
    logout() {
      store.authToken = undefined
      store.authEmail = ""
    },
    async afterCreate() {
      this.setAuthTokenStatus("loading")
      const authToken = await getPasswordFromKeychain()
      this.setAuthToken(authToken)
      this.setAuthTokenStatus("loaded")
    }
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
interface AuthenticationStoreVolatileProps {
  authTokenStatus: "loading" | "loaded" | "none"
}

// @demo remove-file
