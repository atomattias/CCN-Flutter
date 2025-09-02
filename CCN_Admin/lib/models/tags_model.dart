class Tag {
  final String id;
  final String name;
  final String description;

  Tag({
    required this.id,
    required this.name,
    required this.description,
  });

  factory Tag.fromJson(Map<String, dynamic> json) {
    return Tag(
      id: json['_id'],
      name: json['name'],
      description: json['description'],
    );
  }
}
