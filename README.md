# lux

Calling methods using `node-soap` could be something sometimes, so we replace it will
classes and methods

## How to install

```sh
yarn add @random-guys/lux
```

## How does it work

Assume a service request

```xml
<House>
  <Tools>
    <Electric>
      <Longitude>32.3</Longitude>
      <Latitude>6.3</Latitude>
    </Electric>
  </Tools>
</House>
```

With this response

```xml
<ElectricResult>
  <response> 00 | Open successful</response>
</ElectricResult>
```

```ts
interface Position {
  long: number;
  lat: number;
}

class MyService extends AutoService {
  openMyFridge(pos: Position) {
    return this.callFormatted(
      false,
      {
        Longitude: pos.long,
        Latitude: pos.lat
      },
      "House",
      "Tools",
      "Electric"
    );
  }
}
```

- Method `callEmbedded` doesn't try to check for a status/error code
- Method `call` returns the method without parsing anything
