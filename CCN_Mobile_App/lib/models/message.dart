class Message {
  final String id;
  final String content;
  final String userId;
  final String channelId;
  final DateTime createdAt;
  final bool? forwarded;
  final String? fromChannel;

  Message({
    required this.id,
    required this.content,
    required this.userId,
    required this.channelId,
    required this.createdAt,
    this.forwarded,
    this.fromChannel,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['_id'] ?? json['id'] ?? '',
      content: json['content'] ?? '',
      userId: json['userId'] ?? '',
      channelId: json['channelId'] ?? '',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      forwarded: json['forwarded'],
      fromChannel: json['fromChannel'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'content': content,
      'userId': userId,
      'channelId': channelId,
      'createdAt': createdAt.toIso8601String(),
      'forwarded': forwarded,
      'fromChannel': fromChannel,
    };
  }
}
