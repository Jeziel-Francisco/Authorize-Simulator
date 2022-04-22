import { Request, Response } from 'express'
import axios from 'axios'

import Charge from '../schemas/Charge'

class ChargeController {
  public async getChargeByQrcode (req: Request, res: Response): Promise<Response> {
    const { walletCnpj, qrcode } = req.params

    const { data } = await axios.get(`${process.env.URL_BASE_QRLINX}/wallet-hub-linx-payment/v2/payment/data/${walletCnpj}/${qrcode}`, {
      headers: {
        'Apim-Company-Target': process.env.TARGET_QRLINX,
        'Apim-Company-Channel': process.env.CHANNEL_QRLINX,
        'Ocp-Apim-Subscription-Key': process.env.KEY_QRLINX
      }
    })

    const charge = await Charge.create({
      qrcode: qrcode,
      walletCnpj: walletCnpj,
      chargeId: data.data.payment_id,
      orderId: data.data.order_id,
      value: data.data.value,
      storeCnpj: data.data.store.cnpj,
      storename: data.data.store.trading_name
    })

    return res.json(charge)
  }
}

export default new ChargeController()
