import { Request, Response } from 'express'

import Payment from '../schemas/Payment'
import Event from '../schemas/Event'

const operationConfirm = 'CONFIRM'
const operationUndone = 'UNDONE'
const operationCanceled = 'CANCELED'

const operationStatusFail = 'FAIL'

class DefaultWalletController {
  public async undone (req: Request, res: Response): Promise<Response> {
    const { transactionId } = req.params

    if (!transactionId) {
      return res.status(400).send('transactionId deve ser informado!')
    }

    const payment = await Payment.findOne({ transactionId })

    if (!payment) {
      return res.status(406).send('transactionId inválido!')
    }

    const event = await Event.findOne({ chargeId: payment.charge.chargeId })

    if (event) {
      if (event.operation === operationUndone && event.operationStatus === operationStatusFail) {
        event.status = 'EXECUTED'
        event.dateExecuted = new Date()
        await event.save()

        return res.status(406).send(`Falha devido ao evento configurado previamento ${event._id}`)
      }
    }

    if (payment.status !== 'PAID') {
      return res.status(406).send('status do pagamento inválido!')
    }

    payment.status = 'UNDONE'
    await payment.save()

    return res.json(payment)
  }

  public async confirm (req: Request, res: Response): Promise<Response> {
    const { transactionId } = req.params

    if (!transactionId) {
      return res.status(400).send('transactionId deve ser informado!')
    }

    const payment = await Payment.findOne({ transactionId })

    if (!payment) {
      return res.status(406).send('transactionId inválido!')
    }

    const event = await Event.findOne({ chargeId: payment.charge.chargeId })

    if (event) {
      if (event.operation === operationConfirm && event.operationStatus === operationStatusFail) {
        event.status = 'EXECUTED'
        event.dateExecuted = new Date()
        await event.save()

        return res.status(406).send(`Falha devido ao evento configurado previamento ${event._id}`)
      }
    }

    if (payment.status !== 'PAID') {
      return res.status(406).send('status do pagamento inválido!')
    }

    payment.status = 'CAPTURED'
    await payment.save()

    return res.json(payment)
  }

  public async cancel (req: Request, res: Response): Promise<Response> {
    const { transactionId } = req.params

    if (!transactionId) {
      return res.status(400).send('transactionId deve ser informado!')
    }

    const payment = await Payment.findOne({ transactionId })

    if (!payment) {
      return res.status(406).send('transactionId inválido!')
    }

    const event = await Event.findOne({ chargeId: payment.charge.chargeId })

    if (event) {
      if (event.operation === operationCanceled && event.operationStatus === operationStatusFail) {
        event.status = 'EXECUTED'
        event.dateExecuted = new Date()
        await event.save()

        return res.status(406).send(`Falha devido ao evento configurado previamento ${event._id}`)
      }
    }

    if (payment.status !== 'CAPTURED') {
      return res.status(406).send('status do pagamento inválido!')
    }

    payment.status = 'CANCELED'
    await payment.save()

    return res.json(payment)
  }
}

export default new DefaultWalletController()
