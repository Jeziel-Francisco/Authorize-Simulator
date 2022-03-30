import { Schema, model, Document } from 'mongoose'

interface ChargeInterface extends Document {
    chargeId?: string
    orderId?: string
    value?: number
    storeCnpj?: string
    storeName?: string
    qrcode?: string
    status?: string
    walletCnpj?: string
}

const ChargeSchema = new Schema({
  chargeId: String,
  orderId: String,
  value: Number,
  storeCnpj: String,
  StoreName: String,
  qrcode: String,
  status: {
    type: String,
    default: 'OPEN'
  },
  walletCnpj: String
}, { timestamps: true })

export default model<ChargeInterface>('Charge', ChargeSchema)
export { ChargeSchema }
