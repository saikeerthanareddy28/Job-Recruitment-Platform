package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final UserRepository userRepository;

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<CompanyDto.CompanySummary>>> getAllCompanies() {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllCompanies()));
    }

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<ApiResponse<CompanyDto.CompanySummary>> getCompany(
        @PathVariable Long companyId
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(companyId)));
    }

    @PostMapping("/recruiter/companies")
    public ResponseEntity<ApiResponse<CompanyDto.CompanySummary>> createCompany(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CompanyDto.CreateCompanyRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Company created", companyService.createCompany(user.getId(), request)));
    }

    @PutMapping("/recruiter/companies/{companyId}")
    public ResponseEntity<ApiResponse<CompanyDto.CompanySummary>> updateCompany(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long companyId,
        @Valid @RequestBody CompanyDto.UpdateCompanyRequest request
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Company updated",
            companyService.updateCompany(user.getId(), companyId, request)));
    }

    @PostMapping("/recruiter/companies/{companyId}/logo")
    public ResponseEntity<ApiResponse<CompanyDto.CompanySummary>> uploadLogo(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long companyId,
        @RequestParam("file") MultipartFile file
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Logo uploaded",
            companyService.uploadLogo(user.getId(), companyId, file)));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
