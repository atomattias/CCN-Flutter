// ignore_for_file: invalid_annotation_target

part of models;

class User {
  final String id;
  final String email;
  final String fullname;
  final String? address;
  final String? country;
  final String? phone;
  final String? role;
  final String? status;

  User({
    required this.id,
    required this.email,
    required this.fullname,
    this.address,
    this.country,
    this.phone,
    this.role,
    this.status,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      fullname: json['fullname'] ?? '',
      address: json['address'],
      country: json['country'],
      phone: json['phone'],
      role: json['role'],
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'email': email,
      'fullname': fullname,
      'address': address,
      'country': country,
      'phone': phone,
      'role': role,
      'status': status,
    };
  }
}
