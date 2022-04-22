import { Router } from 'express'
import ChargeController from './controllers/ChargeController'
import EventController from './controllers/EventController'
import PaidController from './controllers/PaidController'
import DefaultWalletController from './controllers/DefaultWalletController'
import MercadoPagoWalletController from './controllers/MercadoPagoWalletController'

const routes = Router()

/// Carteira lê o qrcode
routes.get('charge/:walletCnpj/:qrcode', ChargeController.getChargeByQrcode)

/// _________________________________ DEFAULT WALLETS _________________________________
/// Autorizar/Negar pagamento de cobrança
routes.post('/default-wallet/paid/:chargeId/:status', PaidController.paidChargeDefaultWallet)
/// Desfazer pagamento de cobrança
routes.post('/default-wallet/undone/:transactionId', DefaultWalletController.undone)
/// Confirmar pagamento de cobrança
routes.post('/default-wallet/confirm/:transactionId', DefaultWalletController.confirm)
/// Cancelar pagamento
routes.post('/default-wallet/cancel/:transactionId', DefaultWalletController.cancel)

/// __________________________ EVENTOS QUE MANIPULA RESPOSTAS __________________________
/// Criar evento para manipular respostas nos endpoints de desfazimento, confirmação e cancelamento
routes.post('/event', (EventController.create))
/// Remover eventos que manipulam repostas nos endpoints de desfazimento, confirmação e cancelamento
routes.delete('/event/:eventId', (EventController.delete))

/// ________________________________ MERCADO PAGO WALLET ________________________________
// Autorizar/Negar pagamento de cobrança, em caso de autorização é possivel definir o envio do callback para o parceiro
routes.post('/mercadopago-wallet/paid', PaidController.paidChargeMercadoPagoWallet)
/// Consulta pagamento pelo transacionId
routes.get('/mercadopago-wallet/paid', PaidController.getPaidChargeMercadoPagoWallet)

routes.post('/mercadopago-wallet/undone/:transactionId', MercadoPagoWalletController.undone)
routes.post('/mercadopago-wallet/confirm/:transactionId', MercadoPagoWalletController.confirm)
routes.post('/mercadopago-wallet/cancel/:transactionId', MercadoPagoWalletController.cancel)

export default routes
