import { Schema, model, Document } from 'mongoose'

interface EventInterface extends Document {
    chargeId?: string
    operation?: string
    operationStatus?: string
    status?: string
    dateExecuted?: Date
}

const EventSchema = new Schema({
  chargeId: String,
  operation: String,
  operationStatus: String,
  status: {
    type: String,
    default: 'PENDING'
  },
  dateExecuted: Date
}, { timestamps: true })

export default model<EventInterface>('Event', EventSchema)
