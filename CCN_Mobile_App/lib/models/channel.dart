class Channel {
  final String id;
  final String name;
  final String tag;
  final String? description;
  final String? image;
  final String creatorId;
  final DateTime createdAt;

  Channel({
    required this.id,
    required this.name,
    required this.tag,
    this.description,
    this.image,
    required this.creatorId,
    required this.createdAt,
  });

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      tag: json['tag'] ?? '',
      description: json['description'],
      image: json['image'],
      creatorId: json['creatorId'] ?? '',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'tag': tag,
      'description': description,
      'image': image,
      'creatorId': creatorId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
