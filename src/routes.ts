import { Router } from 'express'
import ChargeController from './controllers/ChargeController'
import EventController from './controllers/EventController'
import PaidController from './controllers/PaidController'
import DefaultWalletController from './controllers/DefaultWalletController'

const routes = Router()

routes.get('/charge/:walletCnpj/:qrcode', ChargeController.getChargeByQrcode)

routes.post('/paid/:chargeId/:status', PaidController.paidCharge)

routes.post('/picpay/undone/:transactionId', DefaultWalletController.undone)
routes.post('/picpay/confirm/:transactionId', DefaultWalletController.confirm)
routes.post('/picpay/cancel/:transactionId', DefaultWalletController.cancel)

routes.post('/event', (EventController.create))
/// Desfazimento
/// Confirmação
/// Cancelamento

export default routes
