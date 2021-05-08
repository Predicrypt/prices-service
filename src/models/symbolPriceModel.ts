import mongoose, { Document, Model, Schema } from 'mongoose';
import { Enums } from '@Predicrypt/common';

interface SymbolPriceAttrs {
  open: number;
  high: number;
  low: number;
  close: number;
  openTime: number;
  closeTime: number;
  interval: Enums.CandlestickIntervals;
}

interface SymbolPriceDoc extends Document {
  open: number;
  high: number;
  low: number;
  close: number;
  openTime: number;
  closeTime: number;
  interval: Enums.CandlestickIntervals;
}

const symbolPriceSchema = new Schema<SymbolPriceDoc>(
  {
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    openTime: {
      type: Number,
      required: true,
      index: true,
    },
    closeTime: {
      type: Number,
      required: true,
      index: true,
    },
    interval: {
      type: Enums.CandlestickIntervals,
      required: true,
      index: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const buildSymbolPrice = (collection: string, attrs: SymbolPriceAttrs) => {
  const SymbolPrice = getSymbolPriceCollection(collection);

  return new SymbolPrice(attrs);
};

export const getSymbolPriceCollection = (collection: string) => {
  return mongoose.model<SymbolPriceDoc>(
    collection,
    symbolPriceSchema
  );
};
