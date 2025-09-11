import { PaymentsAppApi } from "./paymentsAppApi";
import Service from "../../service";
import Client from "../../client";
export default class PaymentsAppAPI extends Service {
    constructor(client: Client);
    get PaymentsAppApi(): PaymentsAppApi;
}
