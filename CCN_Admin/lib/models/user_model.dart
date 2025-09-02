class User {
  final String id;
  final String fullname;
  final String email;
  final String role;
  final String status;
  bool isSelected; // Add isSelected property

  User({
    required this.id,
    required this.fullname,
    required this.email,
    required this.role,
    required this.status,
    this.isSelected = false, // Default isSelected to false
  });

  // Add a copyWith method to create a new instance of User with updated fields
  User copyWith({
    String? id,
    String? fullname,
    String? email,
    String? role,
    String? status,
    bool? isSelected,
  }) {
    return User(
      id: id ?? this.id,
      fullname: fullname ?? this.fullname,
      email: email ?? this.email,
      role: role ?? this.role,
      status: status ?? this.status,
      isSelected: isSelected ?? this.isSelected,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      fullname: json['fullname'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      status: json['status'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'fullname': fullname,
      'email': email,
      'role': role,
      'status': status,
    };
  }
}
