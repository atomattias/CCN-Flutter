import 'package:ccn_admin/models/user_model.dart';

class ChannelModel {
  final String id;
  final Map<String, dynamic> owner;
  final String name;
  final String description;
  final List<User> users;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int version;
  final bool disabled;
  final bool specialty; 

  ChannelModel({
    required this.id,
    required this.owner,
    required this.name,
    required this.description,
    required this.users,
    required this.createdAt,
    required this.updatedAt,
    required this.version,
    required this.disabled,
    required this.specialty, 
  });

  factory ChannelModel.fromJson(Map<String, dynamic> json) {
    return ChannelModel(
      id: json['_id'] ?? '',
      owner: json['owner'] ?? {},
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      users: (json['users'] as List<dynamic>?)
              ?.map((userData) => User.fromJson(userData))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt'] ?? ''),
      updatedAt: DateTime.parse(json['updatedAt'] ?? ''),
      version: json['__v'] ?? 0,
      disabled: json['disabled'] ?? false,
      specialty: json['specialty'] ?? false, // Parse the new field
    );
  }
}
