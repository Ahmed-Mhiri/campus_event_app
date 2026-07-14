package de.fhdortmund.mystudyapp.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "University email is required")
    @Email(message = "Invalid email format")
    @Pattern(
        // Blocks common free mail providers, allows everything else ending in .de or .edu
        regexp = "^(?!.*@(gmx|web|gmail|yahoo|hotmail|outlook|icloud|posteo|mailbox)\\.(de|com|net|org)$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.(de|edu)$",
        message = "Must be a valid university email address (e.g., @stud.fh-dortmund.de, @uni-koeln.de)"
    )
    private String universityEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(
        // (?=.*[^A-Za-z0-9]) means "must contain at least one character that is NOT a letter or a number"
        // .{8,} means "allow any combination of characters for the rest of it"
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
        message = "Password must contain uppercase, lowercase, a number, and a special character"
    )
    private String password;

    @NotBlank(message = "Display name is required")
    @Size(min = 2, max = 50, message = "Display name must be between 2 and 50 characters")
    private String displayName;
}