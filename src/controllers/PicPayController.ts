import { Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'

import Payment from '../schemas/Payment'

class PicPayController {
  public async token (req: Request, res: Response): Promise<Response> {
    return res.json({
      access_token: uuidV4(),
      client_id: 'linx-api',
      expires: new Date().getTime() + 10000,
      scope: null
    })
  }

  public async undone (req: Request, res: Response): Promise<Response> {
    const { transactionId } = req.params

    if (!transactionId) {
      return res.send('transactionId deve ser informado!')
    }

    const payment = await Payment.findOne({ transactionId })

    if (!payment) {
      return res.send('transactionId inválido!')
    }

    if (payment.status !== 'PAID') {
      return res.send('status do pagamento inválido!')
    }

    payment.status = 'UNDONE'
    await payment.save()

    return res.json(payment)
  }

  public async confirm (req: Request, res: Response): Promise<Response> {
    const { transactionId } = req.params

    if (!transactionId) {
      return res.send('transactionId deve ser informado!')
    }

    const payment = await Payment.findOne({ transactionId })

    if (!payment) {
      return res.send('transactionId inválido!')
    }

    if (payment.status !== 'PAID') {
      return res.send('status do pagamento inválido!')
    }

    payment.status = 'CAPTURED'
    await payment.save()

    return res.json(payment)
  }

  public async cancel (req: Request, res: Response): Promise<Response> {
    const { transactionId } = req.params

    if (!transactionId) {
      return res.send('transactionId deve ser informado!')
    }

    const payment = await Payment.findOne({ transactionId })

    if (!payment) {
      return res.send('transactionId inválido!')
    }

    if (payment.status !== 'CAPTURED') {
      return res.send('status do pagamento inválido!')
    }

    payment.status = 'CANCELED'
    await payment.save()

    return res.json(payment)
  }
}

export default new PicPayController()
