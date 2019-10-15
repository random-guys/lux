import { UnsafeSyncService } from '../src';
import { createLogger } from 'bunyan';

const endpoint =
  'https://pass.sterling.ng/SxSService/OTPCentralService.asmx?WSDL';
const namespace = ['OTPCentralService', 'OTPCentralServiceSoap'];
const payload = {
  username: 'fakeUser',
  hashkey: '121212121212121211121',
  otp: '999999'
};

describe('Unsafe Async Ops', () => {
  const service = new UnsafeSyncService(
    endpoint,
    createLogger({
      name: 'test-logger'
    })
  );

  it('should describe the world', async () => {
    const description = await service.getDescription();
    expect(description).toBeTruthy();
  });

  it('should describe the world', async () => {
    const result = await service.call(payload, ...namespace, 'OtpValidation');
    expect(result).toBeTruthy();
  });
});
