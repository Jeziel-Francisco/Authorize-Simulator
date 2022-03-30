import { Request, Response } from 'express'
import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'

import Charge from '../schemas/Charge'
import Payment from '../schemas/Payment'

class PaidController {
  public async paidCharge (req: Request, res: Response): Promise<Response> {
    const statusPaid = 'PAID'
    const statusUndone = 'UNDONE'
    const clientPayer = {
      firstName: 'QrLinx',
      lastName: 'Wallet Hub',
      email: 'qrlinx@gmail.com.br',
      areaCode: '14',
      number: '996661185',
      extension: '+55',
      cpfOrCnpj: '99732539062'
    }

    const { chargeId, status } = req.params

    const transactionId = uuidV4()

    const charge = await Charge.findOne({ chargeId })

    if (!status) {
      return res.status(406).send('Status deve ser preenchido!')
    }

    if (status.toUpperCase() !== statusPaid && status.toUpperCase() !== statusUndone) {
      return res.status(406).send(`Status inválido, favor preencher com 'PAGO': ${statusPaid} ou 'NÃO PAGO': ${statusUndone}!`)
    }

    if (!charge) {
      return res.status(406).send('Cobrança não encontrada!')
    }

    const bodyRequest = {
      payment_id: charge.chargeId,
      order_id: charge.orderId,
      transaction_id: transactionId,
      discount_value: 0.0,
      value: charge.value,
      payment_status: {
        id: status.toUpperCase() === statusPaid ? 7 : 9
      },
      client_payers: [
        {
          first_name: clientPayer.firstName,
          last_name: clientPayer.lastName,
          email: clientPayer.email,
          external_code: 'wallet simulator 1',
          client_phone: {
            area_code: clientPayer.areaCode,
            number: clientPayer.number,
            extension: clientPayer.extension
          },
          client_identification: {
            type: clientPayer.cpfOrCnpj.length > 11 ? 'CNPJ' : 'CPF',
            number: clientPayer.cpfOrCnpj
          }
        }
      ]
    }

    await axios.post(`${process.env.URL_BASE_QRLINX}/wallet-hub-linx-payment/v2/payment/callback/`,
      bodyRequest,
      {
        headers: {
          'Apim-Company-Target': process.env.TARGET_QRLINX,
          'Apim-Company-Channel': process.env.CHANNEL_QRLINX,
          'Ocp-Apim-Subscription-Key': process.env.KEY_QRLINX
        }
      })

    charge.status = 'CLOSED'

    await charge.save()

    const payment = await Payment.create({
      value: charge[0].value,
      transactionId,
      status,
      clientPayer,
      charge: charge[0]
    })

    return res.json(payment)
  }
}

export default new PaidController()
