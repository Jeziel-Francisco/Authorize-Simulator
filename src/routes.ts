import { Router } from 'express'
import ChargeController from './controllers/ChargeController'
import EventController from './controllers/EventController'
import PaidController from './controllers/PaidController'
import TokenController from './controllers/PicPayController'

const routes = Router()

routes.get('/charge/:walletCnpj/:qrcode', ChargeController.getChargeByQrcode)

routes.post('/paid/:chargeId/:status', PaidController.paidCharge)

routes.post('/picpay/token', TokenController.token)
routes.post('/picpay/undone/:transactionId', TokenController.undone)
routes.post('/picpay/confirm/:transactionId', TokenController.confirm)
routes.post('/picpay/cancel/:transactionId', TokenController.cancel)

routes.post('/event', (EventController.create))
/// Desfazimento
/// Confirmação
/// Cancelamento

export default routes
