import { createLogger } from "bunyan";
import { AutoService } from "../src/service/auto";

const OTP_ENDPOINT = "http://www.dneonline.com/calculator.asmx?WSDL";

describe("AutoService", () => {
  jest.setTimeout(10000);
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
    expect(description).toBeTruthy();
  });

  it("should describe the world", async () => {
    const result = await service.callEmbedded({ intA: 1, intB: 2 }, "Add");
    expect(result).toBe(3);
  });
});
