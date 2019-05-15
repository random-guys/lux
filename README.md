# lux

Classes as services, class methods as service methods

## How to install?

`yarn add @random-guys/lux`

## How does it work?

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
  long: number
  lat: number
}

class MyService extends SoapService {

  openMyFridge(pos: Position) {
    return this.call(false, {
      Longitude: pos.long,
      Latitude: pos.lat
    }, 'House', 'Tools', 'Electric')
  }
}
```
