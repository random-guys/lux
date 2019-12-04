import { createLogger } from "bunyan";
import { AutoService } from "../src/service/auto";

const OTP_ENDPOINT =
  "https://pass.sterling.ng/SxSService/OTPCentralService.asmx?WSDL";

describe("AutoService", () => {
  jest.setTimeout(30000);
  let service: AutoService;

  beforeEach(() => {
    service = new AutoService(
      OTP_ENDPOINT,
      createLogger({
        name: "test-logger"
      })
    );
  });

  it("should return a t", async () => {
    const description = await service.getDescription();
    console.log(description);
    expect(description).toBeTruthy();
  });

  it("should describe the world", async () => {
    const result = await service.call(
      { username: "fakeUser", hashkey: "121212121212121211121", otp: "999999" },
      "OTPCentralService",
      "OTPCentralServiceSoap",
      "OtpValidation"
    );
    expect(result).toBeTruthy();
  });
});
