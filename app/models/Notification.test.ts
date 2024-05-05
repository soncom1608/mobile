import { NotificationModel } from "./Notification"

test("can be created", () => {
  const instance = NotificationModel.create({})

  expect(instance).toBeTruthy()
})
