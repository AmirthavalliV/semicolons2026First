public with sharing class ClaimIntakeController {
    @AuraEnabled(cacheable=false)
    public static String submitClaim(String message) {
        if (String.isBlank(message)) {
            throw new AuraHandledException('Message is required.');
        }

        String lower = message.toLowerCase();
        if (lower.contains('policy')) {
            return 'Please share your policy number (for example: POL-12345).';
        }
        if (lower.contains('date')) {
            return 'Please provide the incident date in YYYY-MM-DD format.';
        }
        if (lower.contains('accident') || lower.contains('theft') || lower.contains('fire') || lower.contains('injury')) {
            return 'Thank you. Please attach any supporting documents and confirm your policy number.';
        }

        return 'Thanks for the details. Tell me the incident date, claim type, and any other important information.';
    }
}
