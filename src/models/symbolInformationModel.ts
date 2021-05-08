import mongoose, { Document, Model, Schema } from 'mongoose';
import { Enums } from '@Predicrypt/common';

interface SymbolInformationAttrs {
  symbol: string;
  status: Enums.SymbolStatus;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quoteAssetPrecision: number;
  orderTypes: Enums.OrderTypes[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: Enums.FilterTypes[];
  permissions: string[];
}

interface SymbolInformationModel extends Model<SymbolInformationDoc> {
  build(attrs: SymbolInformationAttrs): SymbolInformationDoc;
}

interface SymbolInformationDoc extends Document {
  symbol: string;
  status: Enums.SymbolStatus;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quoteAssetPrecision: number;
  orderTypes: Enums.OrderTypes[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: Enums.FilterTypes[];
  permissions: string[];
}

const symbolInformationSchema = new Schema<
  SymbolInformationDoc,
  SymbolInformationModel
>(
  {
    symbol: {
      type: String,
      required: true,
      indexed: true,
    },
    status: {
      type: Enums.SymbolStatus,
      required: true,
    },
    baseAsset: {
      type: String,
      required: true,
    },
    baseAssetPrecision: {
      type: Number,
      required: true,
    },
    quoteAsset: {
      type: String,
      required: true,
    },
    quoteAssetPrecision: {
      type: Number,
      required: true,
    },
    orderTypes: {
      type: Enums.OrderTypes,
      required: true,
    },
    icebergAllowed: {
      type: Boolean,
      required: true,
    },
    ocoAllowed: {
      type: Boolean,
      required: true,
    },
    isSpotTradingAllowed: {
      type: Boolean,
      required: true,
    },
    isMarginTradingAllowed: {
      type: Boolean,
      required: true,
    },
    filters: {
      type: Enums.FilterTypes,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
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

symbolInformationSchema.statics.build = (attrs: SymbolInformationAttrs) => {
  return new SymbolInformation(attrs);
};

export const SymbolInformation = mongoose.model(
  'SymbolInformation',
  symbolInformationSchema
);
