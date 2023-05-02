export interface Constants {
  WebAppUrl: string;
}

const ProdConstants: Constants = {
  WebAppUrl: "https://syft.dev",
};

const DevConstants: Constants = {
  WebAppUrl: "http://localhost:3000",
};

export const getConstants = async () => {
  const self = await chrome.management.getSelf();
  if (self.installType === "development") {
    return DevConstants;
  }
  return ProdConstants;
};
