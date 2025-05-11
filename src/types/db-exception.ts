import { StoreErrorCode } from './result';
import { SqliteError } from 'better-sqlite3';
export function sqlCatchToStoreError(e: unknown): StoreErrorCode {
    if (e instanceof SqliteError){
        // Known errors
        switch (e.code) {
            case 'P1000':
                return StoreErrorCode.invalidCredentials
            default:
                return StoreErrorCode.unknown
        }
    }
    return StoreErrorCode.unknown
}
