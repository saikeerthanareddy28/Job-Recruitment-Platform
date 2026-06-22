package com.jobportal.service;

import com.jobportal.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private static final List<String> ALLOWED_RESUME_TYPES = Arrays.asList(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    @Value("${app.upload.directory}")
    private String uploadDirectory;

    @PostConstruct
    public void init() {
        log.warn("****************************************************************");
        log.warn("* WARNING: File uploads are stored on the local filesystem at:  *");
        log.warn("* {}     *", uploadDirectory);
        log.warn("* This storage is EPHEMERAL and will be lost on redeploy.       *");
        log.warn("* TODO: Replace with cloud storage (S3, Cloudinary, etc.)       *");
        log.warn("****************************************************************");
    }

    public String storeResume(MultipartFile file) {
        validateFileType(file, ALLOWED_RESUME_TYPES, "Only PDF and Word documents are allowed for resumes");
        return storeFile(file, "resumes");
    }

    public String storeProfilePicture(MultipartFile file) {
        validateFileType(file, ALLOWED_IMAGE_TYPES, "Only JPEG, PNG, GIF, or WebP images are allowed");
        return storeFile(file, "profile-pictures");
    }

    public String storeCompanyLogo(MultipartFile file) {
        validateFileType(file, ALLOWED_IMAGE_TYPES, "Only JPEG, PNG, GIF, or WebP images are allowed");
        return storeFile(file, "company-logos");
    }

    private String storeFile(MultipartFile file, String subdirectory) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null
            ? file.getOriginalFilename() : "unknown");

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String storedFileName = UUID.randomUUID().toString() + extension;

        try {
            Path uploadPath = Paths.get(uploadDirectory, subdirectory);
            Files.createDirectories(uploadPath);

            Path targetLocation = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored: {}/{}", subdirectory, storedFileName);
            return subdirectory + "/" + storedFileName;

        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + storedFileName, ex);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path fullPath = Paths.get(uploadDirectory, filePath);
            Files.deleteIfExists(fullPath);
            log.info("File deleted: {}", filePath);
        } catch (IOException ex) {
            log.warn("Could not delete file: {}", filePath, ex);
        }
    }

    public Path resolveFilePath(String relativePath) {
        return Paths.get(uploadDirectory).resolve(relativePath);
    }

    private void validateFileType(MultipartFile file, List<String> allowedTypes, String errorMessage) {
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BadRequestException(errorMessage);
        }
    }
}