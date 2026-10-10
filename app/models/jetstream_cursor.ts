import { JetstreamCursorSchema } from '#database/schema'

export default class JetstreamCursor extends JetstreamCursorSchema {
  static readonly selfAssignPrimaryKey = true
}
