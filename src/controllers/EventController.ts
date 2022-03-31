import { Request, Response } from 'express'

import Event from '../schemas/Event'

const operationConfirm = 'CONFIRM'
const operationUndone = 'UNDONE'
const operationCanceled = 'CANCELED'

const operationStatusSuccess = 'SUCCESS'
const operationStatusFail = 'FAIL'

class EventController {
  public async create (req: Request, res: Response): Promise<Response> {
    const event = req.body

    if (!event.chargeId) {
      return res.status(400).send('chargeId deve ser informado!')
    }

    if (!event.operation) {
      return res.status(400).send('operation deve ser informado!')
    }

    if (!event.operationStatus) {
      return res.status(400).send('operationStatus deve ser informado!')
    }

    if (event.operation !== operationConfirm && event.operation !== operationCanceled && event.operation !== operationUndone) {
      return res.status(406).send('valor do campo operation é inválido!')
    }

    if (event.operationStatus !== operationStatusSuccess && event.operationStatus !== operationStatusFail) {
      return res.status(406).send('valor do campo operationStatus é inválido!')
    }

    const oldEvent = await Event.findOne({ chargeId: event.chargeId, operation: event.operation })

    if (oldEvent) {
      return res.status(406).send('Já existe um evento para a mesma operação!')
    }

    const eventResult = await Event.create(event)

    return res.json(eventResult)
  }
}

export default new EventController()
