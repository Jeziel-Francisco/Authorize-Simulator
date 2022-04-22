import { Request, Response } from 'express'
import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'

import Charge from '../schemas/Charge'
import Payment from '../schemas/Payment'

const CNPJ_MERCADO_PAGO = '10573521000191'
const CHARGE_STATUS = {
  open: 'OPEN',
  close: 'CLOSED'
}
const PAID_STATUS = {
  paid: 'PAID',
  undone: 'UNDONE'
}
const CLIENT_PAYER = {
  firstName: 'QrLinx',
  lastName: 'Wallet Hub',
  email: 'qrlinx@gmail.com.br',
  areaCode: '14',
  number: '996661185',
  extension: '+55',
  cpfOrCnpj: '99732539062'
}

class PaidController {
  public async paidChargeDefaultWallet (req: Request, res: Response): Promise<Response> {
    const { chargeId, status } = req.params

    const transactionId = uuidV4()

    if (!status) {
      return res.status(400).send('Status deve ser preenchido!')
    }

    if (status.toUpperCase() !== PAID_STATUS.paid && status.toUpperCase() !== PAID_STATUS.undone) {
      return res.status(406).send(`Status inválido, favor preencher com 'PAGO': ${PAID_STATUS.paid} ou 'NÃO PAGO': ${PAID_STATUS.undone}!`)
    }

    const charge = await Charge.findOne({ chargeId })

    if (!charge) {
      return res.status(406).send('Cobrança não encontrada!')
    }

    if (charge.walletCnpj === CNPJ_MERCADO_PAGO) {
      return res.status(406).send('Não apto a pagar com a carteira mercado pago, por gentileza utilizar o endpoint mercadopago-wallet/paid')
    }

    if (charge.status === CHARGE_STATUS.close) {
      return res.status(406).send('Cobrança não pode ser paga, pois já se encontra com status fechado')
    }

    const bodyRequest = {
      payment_id: charge.chargeId,
      order_id: charge.orderId,
      transaction_id: transactionId,
      discount_value: 0.0,
      value: charge.value,
      payment_status: {
        id: status.toUpperCase() === PAID_STATUS.paid ? 7 : 9
      },
      client_payers: [
        {
          first_name: CLIENT_PAYER.firstName,
          last_name: CLIENT_PAYER.lastName,
          email: CLIENT_PAYER.email,
          external_code: 'wallet simulator 1',
          client_phone: {
            area_code: CLIENT_PAYER.areaCode,
            number: CLIENT_PAYER.number,
            extension: CLIENT_PAYER.extension
          },
          client_identification: {
            type: CLIENT_PAYER.cpfOrCnpj.length > 11 ? 'CNPJ' : 'CPF',
            number: CLIENT_PAYER.cpfOrCnpj
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

    charge.status = CHARGE_STATUS.close

    await charge.save()

    const payment = await Payment.create({
      value: charge[0].value,
      transactionId,
      status,
      CLIENT_PAYER,
      charge: charge[0]
    })

    return res.json(payment)
  }

  public async paidChargeMercadoPagoWallet (req: Request, res: Response): Promise<Response> {
    const { chargeId, status, sendCallbackQrlinx } = req.body
    const transactionId = new Date().getUTCMilliseconds()

    if (!chargeId) {
      return res.status(400).send('ChargeId deve ser enviado!')
    }

    if (!status) {
      return res.status(400).send('Status deve ser enviado!')
    }

    if (!sendCallbackQrlinx) {
      return res.status(400).send('Flag sendCallbackQrlinx deve ser enviado!')
    }

    const charge = await Charge.findOne({ chargeId })

    if (!charge) {
      return res.status(406).send('Cobrança não encontrada!')
    }

    if (charge.walletCnpj !== CNPJ_MERCADO_PAGO) {
      return res.status(406).send('Não apto a pagar com a carteira diferente de mercado pago, por gentileza utilizar o endpoint default-wallet/paid/:chargeId/:status')
    }

    if (charge.status === CHARGE_STATUS.close) {
      return res.status(406).send('Cobrança não pode ser paga, pois já se encontra com status fechado')
    }

    if (!status) {
      return res.status(400).send('Status deve ser preenchido!')
    }

    charge.status = CHARGE_STATUS.close

    await charge.save()

    const payment = await Payment.create({
      value: charge[0].value,
      transactionId,
      status,
      CLIENT_PAYER,
      charge: charge[0]
    })

    if (sendCallbackQrlinx) {
      /// TODO: Envia request de pagamento ao parceiros
    }

    return res.json(payment)
  }

  public async getPaidChargeMercadoPagoWallet (req: Request, res: Response): Promise<Response> {
    const { transactionId, chargeId } = req.query
    const result = {
      charge: {},
      payment: {}
    }
    const responseBody = {
    }

    if (!chargeId && !transactionId) {
      return res.status(400).send('ChargeId ou transactionId deve ser preenchido!')
    }

    if (chargeId) {
      result.charge = await Charge.findOne({ chargeId })

      if (!result.charge) {
        return res.status(406).send('Cobrança não encontrada!')
      }

      result.payment = await Payment.findOne({ charge: result.charge })
    }

    if (transactionId) {
      result.payment = await Payment.findOne({ transactionId: transactionId })
    }

    if (result.payment) {
      /// TODO: Montar resposta da request
    }

    return res.json(responseBody)
  }
}

export default new PaidController()
