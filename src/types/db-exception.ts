import { StoreErrorCode } from './result';
import { SqliteError } from 'better-sqlite3';
export function sqlCatchToStoreError(e: unknown): StoreErrorCode {
    if (e instanceof SqliteError) {
        // Known errors
        console.error(e.code)
        switch (e.code) {
            case 'SQLITE_ERROR':
            case 'SQLITE_ERROR_MISSING_COLLSEQ':
            case 'SQLITE_ERROR_RETRY':
            case 'SQLITE_ERROR_SNAPSHOT':
                return StoreErrorCode.unknown;

            case 'SQLITE_INTERNAL':
                return StoreErrorCode.engineFault;

            case 'SQLITE_PERM':
                return StoreErrorCode.permissionFault;

            case 'SQLITE_ABORT':
            case 'SQLITE_ABORT_ROLLBACK':
                return StoreErrorCode.engineFault;

            case 'SQLITE_BUSY':
            case 'SQLITE_BUSY_RECOVERY':
            case 'SQLITE_BUSY_SNAPSHOT':
            case 'SQLITE_BUSY_TIMEOUT':
                return StoreErrorCode.permissionFault;

            case 'SQLITE_LOCKED':
            case 'SQLITE_LOCKED_SHAREDCACHE':
            case 'SQLITE_LOCKED_VTAB':
                return StoreErrorCode.lockFault;

            case 'SQLITE_NOMEM':
            case 'SQLITE_IOERR_NOMEM':
                return StoreErrorCode.engineFault;

            case 'SQLITE_READONLY':
            case 'SQLITE_READONLY_RECOVERY':
            case 'SQLITE_READONLY_CANTLOCK':
            case 'SQLITE_READONLY_ROLLBACK':
            case 'SQLITE_READONLY_DBMOVED':
            case 'SQLITE_READONLY_CANTINIT':
            case 'SQLITE_READONLY_DIRECTORY':
                return StoreErrorCode.permissionFault;

            case 'SQLITE_INTERRUPT':
                return StoreErrorCode.engineFault;

            case 'SQLITE_IOERR':
            case 'SQLITE_IOERR_READ':
            case 'SQLITE_IOERR_SHORT_READ':
            case 'SQLITE_IOERR_WRITE':
            case 'SQLITE_IOERR_FSYNC':
            case 'SQLITE_IOERR_DIR_FSYNC':
            case 'SQLITE_IOERR_TRUNCATE':
            case 'SQLITE_IOERR_FSTAT':
            case 'SQLITE_IOERR_UNLOCK':
            case 'SQLITE_IOERR_RDLOCK':
            case 'SQLITE_IOERR_DELETE':
            case 'SQLITE_IOERR_BLOCKED':
            case 'SQLITE_IOERR_ACCESS':
            case 'SQLITE_IOERR_CHECKRESERVEDLOCK':
            case 'SQLITE_IOERR_LOCK':
            case 'SQLITE_IOERR_CLOSE':
            case 'SQLITE_IOERR_DIR_CLOSE':
            case 'SQLITE_IOERR_SHMOPEN':
            case 'SQLITE_IOERR_SHMSIZE':
            case 'SQLITE_IOERR_SHMLOCK':
            case 'SQLITE_IOERR_SHMMAP':
            case 'SQLITE_IOERR_SEEK':
            case 'SQLITE_IOERR_DELETE_NOENT':
            case 'SQLITE_IOERR_MMAP':
            case 'SQLITE_IOERR_GETTEMPPATH':
            case 'SQLITE_IOERR_CONVPATH':
            case 'SQLITE_IOERR_VNODE':
            case 'SQLITE_IOERR_AUTH':
            case 'SQLITE_IOERR_BEGIN_ATOMIC':
            case 'SQLITE_IOERR_COMMIT_ATOMIC':
            case 'SQLITE_IOERR_ROLLBACK_ATOMIC':
            case 'SQLITE_IOERR_DATA':
            case 'SQLITE_IOERR_CORRUPTFS':
            case 'SQLITE_IOERR_IN_PAGE':
                return StoreErrorCode.engineFault;

            case 'SQLITE_CORRUPT':
            case 'SQLITE_CORRUPT_VTAB':
            case 'SQLITE_CORRUPT_SEQUENCE':
            case 'SQLITE_CORRUPT_INDEX':
            case 'SQLITE_EMPTY':
            case 'SQLITE_SCHEMA':
                return StoreErrorCode.inconsistentState;

            case 'SQLITE_NOTFOUND':
                return StoreErrorCode.permissionFault;

            case 'SQLITE_FULL':
                return StoreErrorCode.full;

            case 'SQLITE_CANTOPEN':
            case 'SQLITE_CANTOPEN_NOTEMPDIR':
            case 'SQLITE_CANTOPEN_ISDIR':
            case 'SQLITE_CANTOPEN_FULLPATH':
            case 'SQLITE_CANTOPEN_CONVPATH':
            case 'SQLITE_CANTOPEN_SYMLINK':
                return StoreErrorCode.permissionFault;

            case 'SQLITE_PROTOCOL':
                return StoreErrorCode.engineFault;

            case 'SQLITE_TOOBIG':
            case 'SQLITE_MISMATCH':
            case 'SQLITE_MISUSE':
            case 'SQLITE_RANGE':
                return StoreErrorCode.invalidInput;

            case 'SQLITE_CONSTRAINT':
            case 'SQLITE_CONSTRAINT_CHECK':
            case 'SQLITE_CONSTRAINT_COMMITHOOK':
            case 'SQLITE_CONSTRAINT_FOREIGNKEY':
            case 'SQLITE_CONSTRAINT_FUNCTION':
            case 'SQLITE_CONSTRAINT_NOTNULL':
            case 'SQLITE_CONSTRAINT_PRIMARYKEY':
            case 'SQLITE_CONSTRAINT_TRIGGER':
            case 'SQLITE_CONSTRAINT_UNIQUE':
            case 'SQLITE_CONSTRAINT_VTAB':
            case 'SQLITE_CONSTRAINT_ROWID':
            case 'SQLITE_CONSTRAINT_PINNED':
            case 'SQLITE_CONSTRAINT_DATATYPE':
                return StoreErrorCode.constraintFault;

            case 'SQLITE_AUTH':
            case 'SQLITE_AUTH_USER':
                return StoreErrorCode.invalidCredentials;

            case 'SQLITE_FORMAT':
                return StoreErrorCode.engineFault;

            case 'SQLITE_NOTADB':
                return StoreErrorCode.connectionFault;

            case 'SQLITE_NOTICE':
            case 'SQLITE_NOTICE_RECOVER_WAL':
            case 'SQLITE_NOTICE_RECOVER_ROLLBACK':
            case 'SQLITE_NOTICE_RBU':
                return StoreErrorCode.engineFault;

            case 'SQLITE_WARNING':
            case 'SQLITE_WARNING_AUTOINDEX':
                return StoreErrorCode.engineFault;

            case 'SQLITE_ROW':
            case 'SQLITE_DONE':
                return StoreErrorCode.engineFault;

            case 'SQLITE_OK_LOAD_PERMANENTLY':
            case 'SQLITE_OK_SYMLINK':
                return StoreErrorCode.engineFault;

            default:
                return StoreErrorCode.unknown;
        }
    }
    return StoreErrorCode.unknown
}
/* beginning-of-error-codes */
// #define SQLITE_ERROR        1   /* Generic error */
// #define SQLITE_INTERNAL     2   /* Internal logic error in SQLite */
// #define SQLITE_PERM         3   /* Access permission denied */
// #define SQLITE_ABORT        4   /* Callback routine requested an abort */
// #define SQLITE_BUSY         5   /* The database file is locked */
// #define SQLITE_LOCKED       6   /* A table in the database is locked */
// #define SQLITE_NOMEM        7   /* A malloc() failed */
// #define SQLITE_READONLY     8   /* Attempt to write a readonly database */
// #define SQLITE_INTERRUPT    9   /* Operation terminated by sqlite3_interrupt()*/
// #define SQLITE_IOERR       10   /* Some kind of disk I/O error occurred */
// #define SQLITE_CORRUPT     11   /* The database disk image is malformed */
// #define SQLITE_NOTFOUND    12   /* Unknown opcode in sqlite3_file_control() */
// #define SQLITE_FULL        13   /* Insertion failed because database is full */
// #define SQLITE_CANTOPEN    14   /* Unable to open the database file */
// #define SQLITE_PROTOCOL    15   /* Database lock protocol error */
// #define SQLITE_EMPTY       16   /* Internal use only */
// #define SQLITE_SCHEMA      17   /* The database schema changed */
// #define SQLITE_TOOBIG      18   /* String or BLOB exceeds size limit */
// #define SQLITE_CONSTRAINT  19   /* Abort due to constraint violation */
// #define SQLITE_MISMATCH    20   /* Data type mismatch */
// #define SQLITE_MISUSE      21   /* Library used incorrectly */
// #define SQLITE_NOLFS       22   /* Uses OS features not supported on host */
// #define SQLITE_AUTH        23   /* Authorization denied */
// #define SQLITE_FORMAT      24   /* Not used */
// #define SQLITE_RANGE       25   /* 2nd parameter to sqlite3_bind out of range */
// #define SQLITE_NOTADB      26   /* File opened that is not a database file */
// #define SQLITE_NOTICE      27   /* Notifications from sqlite3_log() */
// #define SQLITE_WARNING     28   /* Warnings from sqlite3_log() */
// #define SQLITE_ROW         100  /* sqlite3_step() has another row ready */
// #define SQLITE_DONE        101  /* sqlite3_step() has finished executing */
/* end-of-error-codes */
