import { Schema, model, Document } from 'mongoose'

import { ChargeSchema } from './Charge'

interface ClientPayerInterface {
    firstName?: string,
    lastName?: string,
    email?: string,
    areaCode?: string,
    number?: string,
    extension?: string,
    cpfOrCnpj?: string
}

interface ChargeInterface {
    chargeId?: string
    orderId?: string
    value?: number
    storeCnpj?: string
    walletCnpj?: string
}

interface PaymentInterface extends Document {
    value?: number
    transactionId?: string
    status?: string
    clientPayer?: ClientPayerInterface
    charge?: ChargeInterface
}

const ClientPayerSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  areaCode: String,
  number: String,
  extension: String,
  cpfOrCnpj: String
})

const PaymentSchema = new Schema({
  value: Number,
  transactionId: String,
  status: String,
  clientPayer: ClientPayerSchema,
  charge: ChargeSchema
}, { timestamps: true })

export default model<PaymentInterface>('Payment', PaymentSchema)
