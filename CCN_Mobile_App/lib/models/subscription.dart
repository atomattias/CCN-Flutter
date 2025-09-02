class Subscription {
  final String id;
  final String userId;
  final String channelId;
  final DateTime subscribedAt;
  final String? status;

  Subscription({
    required this.id,
    required this.userId,
    required this.channelId,
    required this.subscribedAt,
    this.status,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      channelId: json['channelId'] ?? '',
      subscribedAt: DateTime.parse(json['subscribedAt'] ?? DateTime.now().toIso8601String()),
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'channelId': channelId,
      'subscribedAt': subscribedAt.toIso8601String(),
      'status': status,
    };
  }
}
