import {
  BinanceWebsocket,
  WebsocketMarketStream,
  BinanceClient,
  Enums,
} from '@Predicrypt/common';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { SymbolInformation } from '../models/symbolInformationModel';
import { buildSymbolPrice } from '../models/symbolPriceModel';

interface SubscribeObject {
  symbol: string;
  interval: Enums.CandlestickIntervals;
}

interface WebsocketBinance {
  id: number;
  wsClient: BinanceWebsocket;
  open: boolean;
  subscribedToStreams: boolean;
}

const wsList: WebsocketBinance[] = [];
const binanceClient = new BinanceClient();
const MAX_STREAM_SIZE = 1024;
const STREAM_SIZE = 256;

const getAllInformationTokens = async () => {
  const allInfo = await binanceClient.exchangeInformation();

  for (let symbol of allInfo.data.symbols) {
    const s = SymbolInformation.build(symbol);
    await s.save();
  }
};

export const startWebsocketsPrices = async (
  ws: Server<DefaultEventsMap, DefaultEventsMap>
) => {
  let symbols = await SymbolInformation.find();

  if (symbols.length === 0) {
    await getAllInformationTokens();
    symbols = await SymbolInformation.find();
  }

  let klines: SubscribeObject[] = [];
  for (let symbol of symbols) {
    for (let interval of Object.values(Enums.CandlestickIntervals)) {
      klines.push({ symbol: symbol.symbol.toLowerCase(), interval });
    }
  }

  let pos = 0;

  for (let i = 0; i < klines.length / MAX_STREAM_SIZE; i++) {
    const binanceWs = new BinanceWebsocket();
    wsList.push({
      id: i + 1,
      wsClient: binanceWs,
      open: false,
      subscribedToStreams: false,
    });

    console.log(`Created clien ws with id ${i + 1}`);

    binanceWs.ws.on('open', () => {
      console.log(
        `Open connection to Websocket of binance with id: ${wsList[i].id}`
      );
      wsList[i].open = true;
      binanceWs.ws.on('message', (msg: string) => {
        let message;

        if (msg.includes('"result":null')) {
          message = JSON.parse(msg) as WebsocketMarketStream.WebsocketResponse;

          wsList[i].subscribedToStreams = true;
          console.log(
            `Subscribed to ${MAX_STREAM_SIZE} streams on client with id: ${wsList[i].id}`
          );
        }
        if (msg.includes('"e":"kline"')) {
          message = JSON.parse(msg) as WebsocketMarketStream.CandlestickStream;
          onCandleMessage(message, ws);
        }
        if (msg.includes('"error"')) {
          console.log(msg);
        }
      });
      for (let i = 0; i < MAX_STREAM_SIZE / STREAM_SIZE; i++) {
        if (STREAM_SIZE * (pos + 1) < klines.length) {
          binanceWs.subscribeToMultipleKlines(
            klines.slice(STREAM_SIZE * pos, STREAM_SIZE * (pos + 1))
          );
        } else {
          binanceWs.subscribeToMultipleKlines(
            klines.slice(STREAM_SIZE * pos, klines.length - 1));
        }
        pos++;
      }
    });
  }

  ws.on('connection', clientConnected);
};

const clientConnected = (socket: Socket) => {
  socket.on('connect symbol', (msg: string) => {
    const { symbol, interval } = JSON.parse(msg);

    socket.join(`${symbol}_${interval}`);
  });

  socket.on('disconnect symbol', (msg) => {
    const { symbol, interval } = JSON.parse(msg);

    socket.leave(`${symbol}_${interval}`);
  });
};

const onCandleMessage = (
  msg: WebsocketMarketStream.CandlestickStream,
  ws: Server<DefaultEventsMap, DefaultEventsMap>
) => {
  if (msg.e === 'kline') {
    const candle = {
      openTime: msg.k.t,
      closeTime: msg.k.T,
      open: msg.k.o,
      high: msg.k.h,
      low: msg.k.l,
      close: msg.k.c,
      interval: msg.k.i,
      finished: msg.k.x,
    };
    if (candle.finished) {
      const symbol = buildSymbolPrice(`${msg.k.s}_${msg.k.i}`, candle);
      symbol.save();
    }

    ws.to(`${msg.k.s}_${msg.k.i}`).emit(JSON.stringify(candle));
  }
};
