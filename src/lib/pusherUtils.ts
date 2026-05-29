export function getChatChannel(memberId1: string, memberId2: string) {
  return `private-chat-${[memberId1, memberId2].sort().join("--")}`
}
